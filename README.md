# imdb-button
Client-side SVG IMDb rating button

IMDb doesn't provide the old good button for their rating. For those who still need it there is a modern SVG one.
Unfortunately imcluding SVG with &lt;img&gt; tag doesn't allow script execution. So you have to embed it with &lt;object&gt; tag:
```
<object type="image/svg+xml" data="imdb.svg?id=[IMDb ID]" />
```