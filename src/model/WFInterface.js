import dotenv from 'dotenv';
import { join } from "path";
import fetch, { Headers } from 'node-fetch';
import { REST_VERB } from '../utilities.js';

dotenv.config();

const generateRootWFUrl = () => {
    return (new URL(join(process.env['WF_ROOT_URL'], 
        process.env['WF_API_VERSION']))).toString();
}

const addedHeaders = () => {
    const theHeaders = new Headers();
    return theHeaders.append("apiKey", process.env['WF_APIKEY']);
}

class WFInterface {
    static ROOT_URL = generateRootWFUrl();
    static API_KEY = process.env.WF_APIKEY;
    
    constructor(verb = REST_VERB.GET){
        this.verb = verb;
    }

    // checks to see if the plumbing is working.
    async ping () {
        const pingUrl = (new URL(join(WFInterface.ROOT_URL, "USER", 
            `search?emailAddr=${process.env['WF_API_TEST_EMAIL']}`))).toString();
        const res = await fetch(pingUrl, { 
            method: this.verb,
            headers: {
                "apiKey": `${WFInterface.API_KEY}` }
            }
        );
        if(res.ok && res.status === 200) {
            return { error: false, code: res.status, message: await res.json() }
        }
        return { error: true, code: res.status, message: res.statusText }
    }
}

export default WFInterface;