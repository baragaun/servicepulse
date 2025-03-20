#!/usr/bin/env bash

aws ec2 stop-instances --instance-ids i-0bfb64d728b7d57f5
sleep 900
aws ec2 start-instances --instance-ids i-0bfb64d728b7d57f5
aws ec2 describe-instance-status --instance-ids i-0bfb64d728b7d57f5
