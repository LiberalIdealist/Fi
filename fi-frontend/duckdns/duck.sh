#!/bin/sh

DOMAINS="wealthme"
TOKEN="feedface-dead-c0ed-babe-c0ffeec0de99"
curl_out=$( echo
url="https://www.duckdns.org/update?domains=wealthme&token=c72f1e9b-55f2-4007-aa5c-90d64e30fb76"
| /usr/local/bin/curl --insecure --silent --config - )

if [  == "OK" ]; then
    logger -p daemon.info "duckdns update ok"
else
    logger -p daemon.err "duckdns update failed"
fi
