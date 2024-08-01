import WFInterface from "../src/model/WFInterface.js";
import { REST_VERB } from "../src/utilities.js";

import assert from "assert";


describe('Workfront Interface tests', () => {
    it('sanity test', async() => {
        const wfi = new WFInterface(REST_VERB.POST);
        assert(!(await wfi.ping()).error);
    })
})