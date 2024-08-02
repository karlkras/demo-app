import dotenv from 'dotenv';
import { join } from "path";
import fetch from 'node-fetch';
import {REST_VERB, WF_OBJ} from '../utilities.js';

dotenv.config();

const generateRootWFUrl = () => {
    return (new URL(join(process.env['WF_ROOT_URL'], 
        process.env['WF_API_VERSION']))).toString();
}

class WFInterface {
    static ROOT_URL = generateRootWFUrl();
    static API_KEY = process.env.WF_APIKEY;

    static bodyFromMap = (theMap) => {
        const theBody = {};
        theMap.forEach((value, key) => {
            theBody[key] = value;
        });
        return theBody;
    }

    static buildOptions = (methodType, bodyItems = null) => {
        const theOptions = {
            method: methodType,
            headers: {
                "apiKey": `${WFInterface.API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
        if(bodyItems) {
            theOptions["body"] = JSON.stringify(bodyItems);
        }
        return theOptions;
    }

    async createIssue (name) {
        await this.createObj(WF_OBJ.ISSUE, new Map([
            ["name", name],
            ["projectID", process.env['WF_REQUEST_QUEUE_PROJECT_ID']],
            ["queueTopicID", process.env['WF_ONBOARD_QUEUE_TOPIC_ID']]
        ]));
    }

    /**
     * searches for workfront object(s) by a search pattern.
     * @param objCode
     * @param argMap
     * @returns {Promise<{code: number, error: boolean, message: string}|{code: number, error: boolean, message: unknown}>}
     */
    async search (objCode, argMap) {
        // build the search information...
        let searchData = "";
        argMap.forEach((value, key) => {
            if(searchData.length) {
                searchData += "&";
            }
            searchData += `${key}=${value}`;
        });
        const searchUrl = (new URL(join(WFInterface.ROOT_URL, objCode,
          `search?${searchData}`))).toString();
        const res = await fetch(searchUrl,
          WFInterface.buildOptions(REST_VERB.GET)
        );
        if(res.ok && res.status === 200) {
            return { error: false, code: res.status, message: await res.json() }
        }
        return { error: true, code: res.status, message: res.statusText }
    }

    /**
     *
     * @param objCode
     * @param id
     * @param fields
     * @returns {Promise<{code: number, error: boolean, message: string}|{code: number, error: boolean, message: unknown}>}
     */
    async getObj (objCode, id, fields = null) {

        let fieldString = "";
        if(fields) {
            fields.forEach( aField => {
                if(fieldString.length) {
                    fieldString += ",";
                }
                fieldString += aField;
            });
        }
        let getUrl = (new URL(join(WFInterface.ROOT_URL, objCode, id))).toString();
        if(fieldString.length) {
            getUrl += "?fields=" + fieldString;
            getUrl = encodeURI(getUrl);
        }
        const res = await fetch(getUrl,
          WFInterface.buildOptions(REST_VERB.GET)
        );
        if(res.ok && res.status === 200) {
            return { error: false, code: res.status, message: await res.json() }
        }
        return { error: true, code: res.status, message: res.statusText }
    }

    /**
     * creates a workfront object
     * @param objCode
     * @param bodyMap
     * @returns {Promise<{code: number, error: boolean, message: string}|{code: number, error: boolean, message: unknown}>}
     */
    async createObj(objCode, bodyMap) {
        const createUrl = (new URL(join(WFInterface.ROOT_URL, objCode))).toString();

        const res = await fetch(createUrl,
          WFInterface.buildOptions (REST_VERB.POST, WFInterface.bodyFromMap(bodyMap))
        );

        if(res.ok && res.status === 200) {
            return { error: false, code: res.status, message: await res.json() }
        }
        return { error: true, code: res.status, message: res.statusText }
    }

    /**
     * deletes a workfront object.
     * @param objCode
     * @param id
     * @returns {Promise<{code: number, error: boolean, message: string}|{code: number, error: boolean, message: unknown}>}
     */
    async deleteObj(objCode, id) {
        const deleteUrl = (new URL(join(WFInterface.ROOT_URL, objCode, id))).toString();
        const res = await fetch(deleteUrl,
          WFInterface.buildOptions(REST_VERB.DELETE)
        );
        if(res.ok && res.status === 200) {
            return { error: false, code: res.status, message: await res.json() }
        }
        return { error: true, code: res.status, message: res.statusText }
    }

    /**
     * Updates an existing object.
     * @param objCode
     * @param id
     * @param bodyMap
     * @returns {Promise<{code: number, error: boolean, message: string}|{code: number, error: boolean, message: unknown}>}
     */
    async updateObj(objCode, id, bodyMap) {
        const updateUrl = (new URL(join(WFInterface.ROOT_URL, objCode, id))).toString();
        const res = await fetch(updateUrl,
          WFInterface.buildOptions(REST_VERB.PUT, WFInterface.bodyFromMap(bodyMap))
        );
        if(res.ok && res.status === 200) {
            return { error: false, code: res.status, message: await res.json() }
        }
        return { error: true, code: res.status, message: res.statusText }
    }
}

export default WFInterface;