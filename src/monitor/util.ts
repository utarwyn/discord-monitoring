import http from 'http';
import https from 'https';

export class Util {
    public static async fetch(endpoint: string): Promise<any> {
        const fetchModule = endpoint.startsWith('https') ? https : http;
        return new Promise((resolve, reject) => {
            fetchModule
                .get(endpoint, res => {
                    let data = '';
                    res.on('data', function (chunk) {
                        data += chunk;
                    });
                    res.on('end', function () {
                        if (res.statusCode === 200) {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(new Error('Wrong HTTP response code: ' + res.statusCode));
                        }
                    });
                })
                .on('error', reject);
        });
    }
}
