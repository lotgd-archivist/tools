### Usage

First, run `npm install`

Then, run `npm run scrape -- <url>`

Example:
```
npm run scrape -- https://example.com/source.php
```

The script will create an `output` folder with a subfolder for each domain you scrape source files from. In our example above that would be `output/example.com/`.
The script will clear the target folder on each run.

### License

GPLv2.