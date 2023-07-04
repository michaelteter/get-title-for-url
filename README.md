Little tool I built for my personal web link manager.

The Clojure code is the current version.  

I have a cron job on my laptop which periodically reads a sqlite db to get links that don't yet have titles.

For those links, it fetches the page, grabs the title, and stores the title with the link in the db.
In cases where the fetch fails, it updates the failure count for the record.  After too many failures, that
record is ignored in the future (otherwise we end up with an ever-growing list of bad links that we attempt
to fetch each run).

