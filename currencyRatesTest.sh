# !/bin/bash
curl -XPOST localhost:5000/webhook -d @test/resources/currencyRatesTest.json -H "Content-Type: application/json" | json_pp 2> /dev/null
