'use strict';

var AWS = require("aws-sdk");
var route53 = new AWS.Route53();

module.exports.update = (event, context, cb) => {
  if (!event.query.hosted_zone_id) { cb('Missing hosted_zone_id param'); return false; }
  if (!event.query.name) { cb('Missing name param'); return false; }

  route53.changeResourceRecordSets({
    HostedZoneId: event.query.hosted_zone_id,
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: event.query.name,
            Type: 'A',
            ResourceRecords: [ { Value: event.identity.sourceIp } ],
            TTL: 300
          }
        }
      ],
      Comment: 'ddns update'
    }
  }, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      cb('Failed to update record set: ' + JSON.stringify({ message: 'FAIL', err: err.stack }))
    } else {
      cb(null, { message: 'OK' })
    }
  });
}
