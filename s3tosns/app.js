
const AWS = require('aws-sdk');
const util = require('util');

// get reference to S3 client
const s3 = new AWS.S3();

let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        
        
        console.log("Handling event: ", JSON.stringify(event));

        // Read options from the event parameter.
        console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
        const srcBucket = event.Records[0].s3.bucket.name;
        // Object key may have spaces or unicode non-ASCII characters.
        const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
        
        const typeMatch = srcKey.match(/\.([^.]*)$/);
        if (!typeMatch) {
            throw(`Unable to determine file type`);
        }
        
        // Check that the image type is supported  
        const fileType = typeMatch[1].toLowerCase();
        if (fileType != "jpg" && fileType != "png" && fileType != "mp4") {
            throw(`Unsupported type: ${fileType}`);
        }
        
        var url = 'https://'+ srcBucket + '.s3.amazonaws.com/' + srcKey
        console.log('URL to file: ', url);

        //publish to SNS for delivery
        return url; 

    } catch (err) {
        console.log(err);
        return err;
    }

    
};
