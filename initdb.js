/**
 * Creates a new Amazon DynamoDB table with story information
 *
*/

const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const dynamodb = new DynamoDBClient({region: "local", endpoint: "http://localhost:8000"});

var params = {
    TableName: "Stories",
    KeySchema: [
        {AttributeName: "storyid", KeyType: "HASH"}
    ],
    AttributeDefinitions: [
        {AttributeName: "storyid", AttributeType: "S"}
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

var paramsForPassages = {
    TableName: "Passages",
    KeySchema: [
        {AttributeName: "passageid", KeyType: "HASH"}
    ],
    AttributeDefinitions: [
        {AttributeName: "passageid", AttributeType: "S"}
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
}

async function run() {
    try {
        const data = await dynamodb.send(new CreateTableCommand(params));
        console.log("Success", data);
    }
    catch (err) {
        console.log("Error", err);
    }
};

async function runPassage(){
    try{
        const data = await dynamodb.send(new CreateTableCommand(paramsForPassages));
        console.log("Passages Success", data);
    }
    catch (err) {
        console.log("Error", err);
    }
};
run();
runPassage();