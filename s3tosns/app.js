
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
        
        let snsDestination = process.env.SNS_DESTINATION
        if(snsDestination == null || snsDestination == ''){
            throw('Unable to determine SNS destination. Please define SNS_DESTINATION')
        }
        console.log('Delivering to SNS: ', snsDestination);
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


        var snsParameters = {
            TopicArn: 'arn:aws:sns:us-east-1:464570369687:NotifyMe', //add variable for this
            Message: 'INTRUDER!! ' + url
        }


        var sns = new AWS.SNS();
        sns.publish(snsParameters, function (err, data) {
            if (err) {
                console.error('error publishing to SNS');
                callback(Error(err))
            } else {
                console.log('message published to SNS');
                callback(null, "success")
            }
        });

        //publish to SNS for delivery
        return url; 

    } catch (err) {
        console.log(err);
        return err;
    }

    
};
