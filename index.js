const UserSignature =
  require("@zohocrm/nodejs-sdk-2.0/routes/user_signature").UserSignature;
const USDataCenter =
  require("@zohocrm/nodejs-sdk-2.0/routes/dc/us_data_center").USDataCenter;
const EUDataCenter =
  require("@zohocrm/nodejs-sdk-2.0/routes/dc/eu_data_center").EUDataCenter;
const {
  RecordOperations,
  GetRecordsHeader,
  GetRecordsParam,
} = require("@zohocrm/nodejs-sdk-2.0/core/com/zoho/crm/api/record/record_operations");
const ParameterMap =
  require("@zohocrm/nodejs-sdk-2.0/routes/parameter_map").ParameterMap;
const HeaderMap =
  require("@zohocrm/nodejs-sdk-2.0/routes/header_map").HeaderMap;
const ResponseWrapper =
  require("@zohocrm/nodejs-sdk-2.0/core/com/zoho/crm/api/record/response_wrapper").ResponseWrapper;
const InitializeBuilder =
  require("@zohocrm/nodejs-sdk-2.0/routes/initialize_builder").InitializeBuilder;
const Initializer =
  require("@zohocrm/nodejs-sdk-2.0/routes/initializer").Initializer;
const OAuthBuilder =
  require("@zohocrm/nodejs-sdk-2.0/models/authenticator/oauth_builder").OAuthBuilder;
const Levels = require("@zohocrm/nodejs-sdk-2.0/routes/logger/logger").Levels;
const LogBuilder =
  require("@zohocrm/nodejs-sdk-2.0/routes/logger/log_builder").LogBuilder;
const DBBuilder =
  require("@zohocrm/nodejs-sdk-2.0/models/authenticator/store/db_builder").DBBuilder;
const FileStore =
  require("@zohocrm/nodejs-sdk-2.0/models/authenticator/store/file_store").FileStore;
const SDKConfigBuilder =
  require("@zohocrm/nodejs-sdk-2.0/routes/sdk_config_builder").SDKConfigBuilder;
const ProxyBuilder =
  require("@zohocrm/nodejs-sdk-2.0/routes/proxy_builder").ProxyBuilder;

class Record {
  static async getRecords() {
    /*
     * Create an instance of Logger Class that takes two parameters
     * level -> Level of the log messages to be logged. Can be configured by typing Levels "." and choose any level from the list displayed.
     * filePath -> Absolute file path, where messages need to be logged.
     */
    let logger = new LogBuilder()
      .level(Levels.INFO)
      .filePath(`${__dirname}/node_sdk_log.log`)
      .build();

    //   /Users/myke/Desktop/kpi-dash/zoho-sdk/zoho-crm-node-js-example
    /*
     * Create an UserSignature instance that takes user Email as parameter
     */
    let user = new UserSignature("myk.e@zanda.com.au");

    /*
     * Configure the environment
     * which is of the pattern Domain.Environment
     * Available Domains: USDataCenter, EUDataCenter, INDataCenter, CNDataCenter, AUDataCenter
     * Available Environments: PRODUCTION(), DEVELOPER(), SANDBOX()
     */
    let environment = USDataCenter.PRODUCTION();

    /*
     * Create a Token instance
     * clientId -> OAuth client id.
     * clientSecret -> OAuth client secret.
     * grantToken -> OAuth Grant Token.
     * refreshToken -> OAuth Refresh Token token.
     * redirectURL -> OAuth Redirect URL.
     */
    let token = new OAuthBuilder()
      .clientId("1000.AF26FNU7GR4GVB0R2S6CTKLJ8S55NQ")
      .clientSecret("9262493f2c4e34ed55a749632492fdce5984386afe")
      .refreshToken(
        "1000.26636835444660ecc5c267449df6a01f.678a189c3c94b540de8f32bc386a2b6a"
      )
      .redirectURL("http:/localhost:3000")
      .build();

    /*
     * Create an instance of TokenStore.
     * 1 -> DataBase host name. Default "localhost"
     * 2 -> DataBase name. Default "zohooauth"
     * 3 -> DataBase user name. Default "root"
     * 4 -> DataBase password. Default ""
     * 5 -> DataBase port number. Default "3306"
     */
    let tokenstore = new DBBuilder()
      .host("localhost")
      .databaseName("zohooauth")
      .userName("root")
      .portNumber("3306 ")
      .tableName("tableName")
      .password("")
      .build();

    /*
     * Create an instance of FileStore that takes absolute file path as parameter
     */
    let store = new FileStore(`${__dirname}/nodejs_sdk_tokens.txt`);

    // /Users/myke/Desktop/kpi-dash/zoho-sdk/zoho-crm-node-js-example

    /*
     * A Boolean value to allow or prevent auto-refreshing of the modules' fields in the background.
     * if true - all the modules' fields will be auto-refreshed in the background whenever there is any change.
     * if false - the fields will not be auto-refreshed in the background. The user can manually delete the file(s) or the specific module's fields using methods from ModuleFieldsHandler
     */
    let sdkConfig1 = new SDKConfigBuilder()
      .autoRefreshFields(true)
      .pickListValidation(true)
      .build();

    /*
     * The path containing the absolute directory path to store user specific JSON files containing module fields information.
     */
    let resourcePath = `${__dirname}`;
    //   "/Users/myke/Desktop/kpi-dash/zoho-sdk/zoho-crm-node-js-example";

    // let requestProxy = new ProxyBuilder()
    // .host("proxyHost")
    // .port("proxyPort")
    // .user("proxyUser")
    // .password("password")
    // .build();
    /*
     * Call the static initialize method of Initializer class that takes the following arguments
     * user -> UserSignature instance
     * environment -> Environment instance
     * token -> Token instance
     * store -> TokenStore instance
     * SDKConfig -> SDKConfig instance
     * resourcePath -> resourcePath
     * logger -> Logger instance
     */
    try {
      (await new InitializeBuilder())
        .user(user)
        .environment(environment)
        .token(token)
        .store(store)
        .SDKConfig(sdkConfig1)
        .resourcePath(resourcePath)
        .logger(logger)
        .initialize();
    } catch (error) {
      console.log(error);
    }

    try {
      let moduleAPIName = "Leads";

      //Get instance of RecordOperations Class
      let recordOperations = new RecordOperations();

      let paramInstance = new ParameterMap();

      await paramInstance.add(GetRecordsParam.APPROVED, "both");

      let headerInstance = new HeaderMap();

      await headerInstance.add(
        GetRecordsHeader.IF_MODIFIED_SINCE,
        new Date("2020-01-01T00:00:00+05:30")
      );

      //Call getRecords method that takes paramInstance, headerInstance and moduleAPIName as parameters
      let response = await recordOperations.getRecords(
        moduleAPIName,
        paramInstance,
        headerInstance
      );

      if (response != null) {
        //Get the status code from response
        console.log("Status Code: " + response.statusCode);

        if ([204, 304].includes(response.statusCode)) {
          console.log(
            response.statusCode == 204 ? "No Content" : "Not Modified"
          );

          return;
        }

        //Get the object from response
        let responseObject = response.object;

        if (responseObject != null) {
          //Check if expected ResponseWrapper instance is received
          if (responseObject instanceof ResponseWrapper) {
            //Get the array of obtained Record instances
            let records = responseObject.getData();
            const recordData = [];

            for (let index = 0; index < records.length; index++) {
              let record = records[index];

              //Get the ID of each Record
              // console.log("Record ID: " + record.getId());

              //Get the createdBy User instance of each Record
              let createdBy = record.getCreatedBy();
              let createdData = null;

              //Check if createdBy is not null
              if (createdBy != null) {
                //Get the ID of the createdBy User

                createdData = {
                  id: createdBy.getId(),
                  name: createdBy.getName(),
                  email: createdBy.getEmail(),
                  dateCreated: record.getCreatedTime(),
                };

                // console.log(data);
              }

              //Get the CreatedTime of each Record
              // console.log("Record CreatedTime: " + record.getCreatedTime());

              //Get the modifiedBy User instance of each Record
              let modifiedBy = record.getModifiedBy();
              let modifiedData = null;

              //Check if modifiedBy is not null
              if (modifiedBy != null) {
                modifiedData = {
                  id: modifiedBy.getId(),
                  name: modifiedBy.getName(),
                  email: modifiedBy.getEmail(),
                  dateModified: record.getModifiedTime(),
                };
              }

              //Get the ModifiedTime of each Record
              // console.log("Record ModifiedTime: " + record.getModifiedTime());

              //Get the list of Tag instance each Record
              let tags = record.getTag();
              const tagsData = [];

              //Check if tags is not null
              if (tags != null) {
                tags.forEach((tag) => {
                  tagsData.push({ id: tag.getId(), name: tag.getName() });
                });
              }

              //Get all the values
              let keyValues = record.getKeyValues();

              let keyArray = Array.from(keyValues.keys());

              const values = {};

              for (let keyIndex = 0; keyIndex < keyArray.length; keyIndex++) {
                const keyName = keyArray[keyIndex];

                let value = keyValues.get(keyName);

                values[keyName] = value;
              }

              recordData.push({
                id: record.getId(),
                date: record.getCreatedTime(),
                createdData,
                modifiedData,
                tagsData,
                values,
              });
            }

            console.log(recordData);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

Record.getRecords();
