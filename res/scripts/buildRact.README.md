/
<template.+?data-ract-template[="'\s]+?(?<key>[A-Za-z0-9]+)[\S\s]+?<\/template>
/
g
<template matches the characters <template literally (case sensitive)
. matches any character (except for line terminators)
+? matches the previous token between one and unlimited times, as few times as possible, expanding as needed (lazy)
data-ract-template matches the characters data-ract-template literally (case sensitive)
Match a single character present in the list below [="'\s]
+? matches the previous token between one and unlimited times, as few times as possible, expanding as needed (lazy)
="' matches a single character in the list ="' (case sensitive)
\s matches any whitespace character (equivalent to [\r\n\t\f\v ])
Named Capture Group key (?<key>[A-Za-z0-9]+)
Match a single character present in the list below [A-Za-z0-9]
+ matches the previous token between one and unlimited times, as many times as possible, giving back as needed (greedy)
A-Z matches a single character in the range between A (index 65) and Z (index 90) (case sensitive)
a-z matches a single character in the range between a (index 97) and z (index 122) (case sensitive)
0-9 matches a single character in the range between 0 (index 48) and 9 (index 57) (case sensitive)
Match a single character present in the list below [\S\s]
+? matches the previous token between one and unlimited times, as few times as possible, expanding as needed (lazy)
\S matches any non-whitespace character (equivalent to [^\r\n\t\f\v ])
\s matches any whitespace character (equivalent to [\r\n\t\f\v ])
< matches the character < with index 6010 (3C16 or 748) literally (case sensitive)
\/ matches the character / with index 4710 (2F16 or 578) literally (case sensitive)
template> matches the characters template> literally (case sensitive)
Global pattern flags 
g modifier: global. All matches (don't return after first match)

Match 1 276-1012	| <template id="tpl_feeds" data-ract-template="ractfeeds">
                      <tr>
      <td data-ract-aria-labelledb...
Group key 321-330	ractfeeds
----------------------------------------
Match 2 1298-2029	<template id="tpl_feeds" data-ract-template="test">
    <tr>
      <td data-ract-aria-labelledby="la...
Group key 1343-1347	test