import {it, beforeEach, describe} from "node:test";
import dotenv from 'dotenv';
import assert from "node:assert";
import {WF_OBJ} from "../src/utilities.js";
import WFInterface from "../src/model/WFInterface.js";

dotenv.config();

describe("A bunch of workfront api tests for issue interface", () => {
  let WFApi;
  beforeEach(() => {
    WFApi = new WFInterface();
  })
  it("should ping the workfront server", async () => {
    const result = await WFApi.search(WF_OBJ.USER, new Map([
      ["emailAddr", process.env['WF_API_TEST_EMAIL']]
    ]));
    assert.ok(!result.error);
  });

  it("should find the user service request queue project by name", async () => {
    const result = await WFApi.search(WF_OBJ.PROJECT, new Map([
      ["name", process.env['WF_REQUEST_QUEUE_PROJECT']]
    ]));
    assert.ok(!result.error && result.message.data.length === 1);
  })

  it("should find the user service request queue project by id", async () => {
    // first get the project by its name...
    let result = await WFApi.search(WF_OBJ.PROJECT, new Map([
      ["name", process.env['WF_REQUEST_QUEUE_PROJECT']]
    ]));
    // now get it by its id.
    result = await WFApi.getObj(WF_OBJ.PROJECT, result.message.data[0].ID);
    assert.ok(!result.error);
  });

  it("should get the the issues associated with the project queue", async () => {
    // first get the project by its name...
    let result = await WFApi.search(WF_OBJ.PROJECT, new Map([
      ["name", process.env['WF_REQUEST_QUEUE_PROJECT']]
    ]));
    // now get the issues from the project...
    result = await WFApi.search(WF_OBJ.ISSUE, new Map([
      ["projectID", result.message.data[0].ID]
    ]));
    assert.ok(!result.error);
  });

  it("should do a basic create and delete of a project", async () => {
    const projectName = `${Date.now()} - This is a test project`
    // first get the project by its name...
    let result = await WFApi.createObj(WF_OBJ.PROJECT, new Map([
      ["name", projectName]
    ]));
    assert.ok(!result.error);
    // now delete it...
    result = await WFApi.deleteObj(WF_OBJ.PROJECT, result.message.data.ID);
    assert.ok(!result.error);
  });

  it("should add a new onboarding request to the queue project", async () => {
    const requestName = `${Date.now()} - This is a test issue`;
    let result = await WFApi.createObj(WF_OBJ.ISSUE, new Map([
      ["name", requestName],
      ["projectID", process.env['WF_REQUEST_QUEUE_PROJECT_ID']],
      ["queueTopicID", process.env['WF_ONBOARD_QUEUE_TOPIC_ID']]
    ]));
    assert.ok(!result.error);
    // now delete it...
    result = await WFApi.deleteObj(WF_OBJ.ISSUE, result.message.data.ID);
    assert.ok(!result.error);
  });

  it("should add a new onboarding request to the queue project and set some fields", async () => {
    const requestName = `${Date.now()} - This is a test issue`;
    const updateMap = new Map([
      ["DE:Company/Organization Name", "A Test company name"],
      ['DE:Does this client contain departments that need to be set up as "child companies"?', "Yes"],
      ["DE:Provide details about the client's hierarchical structure", "This is a very complicated structure"],
      ["DE:In which State is the client's corporate headquarters located?", "OR"]
    ]);
    let result = await WFApi.createObj(WF_OBJ.ISSUE, new Map([
      ["name", requestName],
      ["projectID", process.env['WF_REQUEST_QUEUE_PROJECT_ID']],
      ["queueTopicID", process.env['WF_ONBOARD_QUEUE_TOPIC_ID']]
    ]));
    assert.ok(!result.error);
    const theIssueId = result.message.data.ID;

    // so now update it...
    result = await WFApi.updateObj(WF_OBJ.ISSUE, result.message.data.ID, updateMap);
    // if there were a problem updating it... clean it up before the assert stops the process..
    if (result.error) {
      await WFApi.deleteObj(WF_OBJ.ISSUE, theIssueId);
    }
    assert.ok(!result.error);
    // so get the issue again, now with the fields...
    result = await WFApi.getObj(WF_OBJ.ISSUE, result.message.data.ID,
      Array.from(updateMap.keys()));
    // check that the fields have been set as expected...
    const customData = Array.from(updateMap.keys());
    customData.forEach(customName => {
      const value = updateMap.get(customName);
      const lookupValue = result.message.data[customName];
      assert.equal(value, lookupValue);
    });
    // now delete it...
    result = await WFApi.deleteObj(WF_OBJ.ISSUE, result.message.data.ID);
    assert.ok(!result.error);
  });
});

