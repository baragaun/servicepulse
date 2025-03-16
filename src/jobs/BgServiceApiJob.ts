import {
  BgNodeClient,
  BgNodeClientConfig, CachePolicy,
  HttpHeaderName,
  UserIdentType,
} from '@baragaun/bg-node-client';

import { BaseJob } from './BaseJob.js';
import { ServiceHealth } from '../enums.js';
import chance from '../helpers/chance.js';
import appLogger from '../helpers/logger.js';
import { BaseService } from '../services/BaseService.js';
import { BgServiceApiJobConfig } from '../types/index.js';

const logger = appLogger.child({ scope: 'BgServiceApiJob' });

export class BgServiceApiJob extends BaseJob {
  private _bgNodeClient?: BgNodeClient;

  public constructor(config: BgServiceApiJobConfig, service: BaseService) {
    super(config, service);
  }

  public get name(): string {
    return 'bg-service-api';
  }

  public async run(): Promise<void> {
    if (!this._bgNodeClient) {
      await this.init();

      if (!this._bgNodeClient) {
        logger.error('BgNodeClient not initialized');
        return;
      }
    }

    const firstName = chance.first();
    const lastName = chance.last();
    const newLastName = chance.last();
    const userHandle = chance.word();
    const password = chance.word();
    const email = chance.email();
    const token = '666666';

    logger.debug('T: calling API/signUpUser', { userHandle, email, password });

    const signUpUserAuthResponse = await this._bgNodeClient.operations.myUser.signUpUser({
      userHandle,
      firstName,
      lastName,
      email,
      password,
      isTestUser: true,
      source: `testtoken=${token}`, // this causes all confirmation tokens to be set to '666666'
    });
    if (signUpUserAuthResponse.error) {
      logger.error('signUpUser returned an error', { error: signUpUserAuthResponse.error });
      this.setOffline('signUpUser: error');
      return;
    }

    const authResponse = signUpUserAuthResponse.object?.userAuthResponse;

    if (!authResponse) {
      logger.error('authResponse is not defined', { signUpUserAuthResponse });
      this.setOffline('signUpUser: error');
      return;
    }

    const myUserId = authResponse.userId;

    if (!myUserId) {
      this.setOffline('myUserId is undefined');
      return;
    }

    if (!authResponse.authToken) {
      this.setOffline('authResponse.authToken is undefined');
      return;
    }

    const clientInfo1 = await this._bgNodeClient?.clientInfoStore.load();
    if (!clientInfo1.myUserId || !clientInfo1.authToken || !clientInfo1.myUserDeviceUuid) {
      this.setOffline('clientInfo1 invalid');
      return;
    }

    logger.debug('T: calling API/signMeOut');

    await this._bgNodeClient.operations.myUser.signMeOut();

    const clientInfo2 = await this._bgNodeClient?.clientInfoStore.load();
    if (clientInfo2.myUserId || clientInfo2.authToken || !clientInfo2.myUserDeviceUuid) {
      this.setOffline('clientInfo2 invalid');
      return;
    }

    logger.debug('T: calling API/signInUser');

    const signInUserResponse = await this._bgNodeClient.operations.myUser.signInUser({
      ident: email,
      identType: UserIdentType.email,
      password,
    });

    if (!signInUserResponse) {
      this.setOffline('signInUserResponse is undefined');
      return;
    }

    if (signInUserResponse.error) {
      this.setOffline('signInUser returned an error');
      return;
    }

    if (!signInUserResponse.object?.userAuthResponse?.userId) {
      this.setOffline('signInUserResponse.object.userAuthResponse.userId is undefined');
      return;
    }

    if (!signInUserResponse.object?.userAuthResponse?.authToken) {
      this.setOffline('signInUserResponse.object.userAuthResponse.authToken is undefined');
      return;
    }

    if (!signInUserResponse.object?.myUser?.id) {
      this.setOffline('signInUserResponse.object.myUser.id is undefined');
      return;
    }

    const clientInfo3 = await this._bgNodeClient?.clientInfoStore.load();
    if (!clientInfo3.myUserId || !clientInfo3.authToken || !clientInfo3.myUserDeviceUuid) {
      this.setOffline('clientInfo3 invalid');
      return;
    }

    logger.debug('T: calling API/updateMyUser');

    await this._bgNodeClient.operations.myUser.updateMyUser(
      {
        id: myUserId,
        lastName: newLastName,
      },
      { cachePolicy: CachePolicy.network },
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const myUserFromNetwork = await this._bgNodeClient.operations.myUser.findMyUser({
      cachePolicy: CachePolicy.network,
    });

    if (myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id) {
      this.setOffline('myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id');
      return;
    }

    if (myUserFromNetwork?.userHandle !== userHandle) {
      this.setOffline('myUserFromNetwork?.userHandle !== userHandle');
      return;
    }

    if (myUserFromNetwork?.firstName !== firstName) {
      this.setOffline('myUserFromNetwork?.firstName !== firstName');
      return;
    }

    if (myUserFromNetwork?.lastName !== newLastName) {
      this.setOffline('myUserFromNetwork?.lastName !== newLastName');
      return;
    }

    if (myUserFromNetwork?.email !== email) {
      this.setOffline('myUserFromNetwork?.email !== email');
      return;
    }

    logger.debug('T: calling API/deleteMyUser');

    const deleteMyUserResponse = await this._bgNodeClient.operations.myUser.deleteMyUser(undefined, undefined, true);

    if (deleteMyUserResponse.error) {
      this.setOffline('deleteMyUser returned an error');
      return;
    }

    logger.debug('T: finished.');
  }

  private setOffline(reason: string): void {
    logger.error('setOffline called.', { reason });
    this._service.setHealth(ServiceHealth.offline, reason);
  }

  private async init(): Promise<void> {
    if (this._bgNodeClient) {
      return;
    }

    if (!this._service) {
      return;
    }

    const config: BgNodeClientConfig = {
      inBrowser: false,
      fsdata: {
        url: (this._config as BgServiceApiJobConfig).url,
        headers: {
          [HttpHeaderName.consumer]: 'servicepulse',
        },
      },
    };

    try {
      this._bgNodeClient = await new BgNodeClient().init(
        config,
        undefined,
        undefined,
        logger,
      );
    } catch (error) {
      logger.error('Error initializing BgNodeClient', error);
      return;
    }

    return;
  }
}
