const { exec } = require('child_process');
const { reverse } = require('dns');

var filter = '*';
if (process.env.INPUT_PATTERN) {
    filter = process.env.INPUT_PATTERN;
}

console.log('\x1b[32m%s\x1b[0m', `Filtering with: ${filter}`);

exec(`git rev-list --tags=${filter} --max-count=1`, (err, rev, stderr) => {
    if (err) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not find any revisions because: ');
        console.log('\x1b[31m%s\x1b[0m', stderr);
        process.exit(1);
    }

    
    rev = rev.trim()
    if(rev.length == 0) {
        console.log('\x1b[33m%s\x1b[0m', 'Did not find matching tag');
        if (process.env.INPUT_FALLBACK) {
            console.log('\x1b[33m%s\x1b[0m', 'Will use fallback tag and HEAD commit');
        } else {
            console.log('\x1b[33m%s\x1b[0m', 'No fallback tag specified');
            process.exit(1);
        }
    }

    exec(`git describe --tags ${rev}`, (err, tag, stderr) => {
        if (err) {
            console.log('\x1b[33m%s\x1b[0m', 'Could not find any tags because: ');
            console.log('\x1b[31m%s\x1b[0m', stderr);
            if (process.env.INPUT_FALLBACK) {
                let timestamp = Math.floor(new Date().getTime() / 1000);
                console.log('\x1b[33m%s\x1b[0m', 'Falling back to default tag');
                console.log('\x1b[32m%s\x1b[0m', `Found tag: ${process.env.INPUT_FALLBACK}`);
                console.log('\x1b[32m%s\x1b[0m', `Found timestamp: ${timestamp}`);
                console.log(`::set-output name=tag::${process.env.INPUT_FALLBACK}`);
                console.log(`::set-output name=timestamp::${timestamp}`);
                process.exit(0);
            }
            process.exit(1);
        }

        tag = tag.trim()

        exec(`git log -1 --format=%at ${tag}`, (err, timestamp, stderr) => {
            if (err) {
                console.log('\x1b[33m%s\x1b[0m', 'Could not find any timestamp because: ');
                console.log('\x1b[31m%s\x1b[0m', stderr);
                process.exit(1);
            }

            timestamp = timestamp.trim()

            console.log('\x1b[32m%s\x1b[0m', `Found tag: ${tag}`);
            console.log('\x1b[32m%s\x1b[0m', `Found timestamp: ${timestamp}`);
            console.log(`::set-output name=tag::${tag}`);
            console.log(`::set-output name=timestamp::${timestamp}`);
            process.exit(0);
        });
    });
});
