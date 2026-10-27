<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Presentation
- All page colors use shared semantic brand tokens in src/styles.css; keep theme changes centralized so every page remains consistent.
- The official uploaded logo is served through an asset pointer; its padded raster favicon is kept in public for browser compatibility.
- Sample content is explicitly labeled in the shared shell; do not present demo rows as official campus information.
- Demo polls share an in-memory provider across homepage and polls page, with one vote per poll per loaded session; no persistence or backend is implied.
