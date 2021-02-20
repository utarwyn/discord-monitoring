#!/usr/bin/env node

import { ConfigProvider } from '@config/ConfigProvider';
import Monitoring from '../src';

new Monitoring(new ConfigProvider())
    .login()
    .then(() => console.log('Monitoring module ready to be used. Check your Discord server!'));
