# imdb-button
Client-side SVG IMDb rating button

IMDb doesn't provide the old good button for their rating. For those who still need it there is a modern SVG one.
Unfortunately imcluding SVG with &lt;img&gt; tag doesn't allow script execution. So you have to embed it with &lt;object&gt; tag:
```
<object type="image/svg+xml" data="imdb.svg?id=[IMDb ID]"></object>
```

In additional you can use 
```
<object type="image/svg+xml" data="[IMDb ID].svg"></object>
```
with something like that in your Nginx config:

```
<location ~/tt[0-9]+\.svg$>
	rewrite /(tt[0-9]+)\.svg$ imdb.svg?id=$1& break;
</location>
```

[Hosted example](https://rating.rumdb.com/)
