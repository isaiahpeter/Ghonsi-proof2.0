- [ ] TASK 4: Convert fuel price to Playwright
  - [x] Updated fuelPrices.js to use Playwright instead of Cheerio
  - [x] Add `playwright` dependency to package.json
  - [ ] Install dependencies (npm i) in backend/ghonsi-data-intelligence
  - [ ] Test via POST http://localhost:3001/api/v1/fuel/run
  - [ ] If NNPCL still returns null, implement fallback source (e.g., pumpsprice.com.ng)

- [ ] TASK 1 (Exchange Rates): Backfill Supabase extracted_content/key_values/pair for cbn_official rows where extracted_content IS NULL
  - [ ] Run the SQL backfill in Supabase:

    UPDATE exchange_rates
    SET extracted_content = currency || '/NGN official rate: buying ₦' || buying_rate || ', central ₦' || central_rate || ', selling ₦' || selling_rate || ' as at ' || rate_date || '.',
        key_values = jsonb_build_object(currency || '_buying', buying_rate, currency || '_central', central_rate, currency || '_selling', selling_rate),
        pair = currency || '/NGN'
    WHERE source_name = 'cbn_official' AND extracted_content IS NULL;

  - [ ] Verify: GET http://localhost:3001/api/v1/rates/official

