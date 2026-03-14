export interface Env { }

type ImdbResponse = {
    resource?: {
        id?: string
        title?: string
        rating?: number
        ratingCount?: number
    }
}

export default {
    async fetch(request: Request): Promise<Response> {

        const url = new URL(request.url)

        const match = url.pathname.match(/^\/(tt\d+)\.svg$/)
        if (!match) {
            return new Response("Invalid path", { status: 404 })
        }

        const cacheKey = new Request(url.toString(), request)

        const cached = await caches.match(cacheKey)
        if (cached) {
            return cached
        }

        const id = match[1]

        const apiUrl =
            `https://p.media-imdb.com/static-content/documents/v1/title/${id}/ratings%3Fjsonp=imdb.rating.run:imdb.api.title.ratings/data.json`

        const apiRes = await fetch(apiUrl, {
            headers: { "user-agent": "Mozilla/5.0" }
        })

        if (!apiRes.ok) {
            return new Response("IMDb request failed", { status: 502 })
        }

        const body = await apiRes.text()

        const jsonMatch = body.match(/\((.*)\)/)
        if (!jsonMatch) {
            return new Response("IMDb response error", { status: 502 })
        }

        const data: ImdbResponse = JSON.parse(jsonMatch[1])

        const title = data.resource?.title ?? ""
        const rating = data.resource?.rating ?? 0
        const count = data.resource?.ratingCount ?? 0

        const svg = buildSvg(
            id,
            title,
            rating.toFixed(1),
            compactInteger(count, 1)
        )

        const response = new Response(svg, {
            headers: {
                "content-type": "image/svg+xml; charset=utf-8",
                "cache-control": "public, s-maxage=86400"
            }
        })

        const cache = await caches.open("default")
        await cache.put(cacheKey, response.clone())

        return response
    }
}

function buildSvg(
    id: string,
    title: string,
    rating: string,
    count: string
): string {

    const link = `https://imdb.com/title/${id}`

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40" width="100" title="${escapeXml(title)}">
<style>
svg { font-family: Arial, Helvetica, sans-serif; cursor:pointer }
#count { transform:translate(95px,3.7em); text-anchor:end; font-size:0.6em }
#rating { transform:translate(95px,1em); text-anchor:end; font-size:1.5em; font-weight:bold }
#logo { transform:translate(7px,7px); fill:#000 }
</style>

<a href="${link}" target="_blank">

<rect width="100%" height="100%" rx="6" fill="#F5C518"/>

<g id="logo">
<polygon points="0 18 5 18 5 0 0 0"></polygon>
</g>

<text id="rating">${rating}</text>
<text id="count">${count}</text>

</a>
</svg>
`.trim()
}

function escapeXml(input: string): string {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;")
}

function compactInteger(value: number, decimals = 0): string {

    const abs = Math.abs(value)

    if (abs < 1000) return value.toString()

    const units = [
        { v: 1e12, s: "T" },
        { v: 1e9, s: "B" },
        { v: 1e6, s: "M" },
        { v: 1e3, s: "k" }
    ]

    for (const u of units) {
        if (abs >= u.v) {
            return (value / u.v).toFixed(decimals) + u.s
        }
    }

    return value.toString()
}