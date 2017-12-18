# !/bin/bash
curl -XPOST localhost:5000/webhook -d @test/currencyRatesTest.js -H "Content-Type: application/json" | json_pp 2> /dev/null
