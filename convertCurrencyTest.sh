# !/bin/bash
curl -XPOST https://chest.one/neee -d @test/resources/convertMoneyTest.json -H "Content-Type: application/json" | json_pp 2> /dev/null
