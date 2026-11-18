/**
 * URL sanitization, normalization, and smart transformation utilities.
 * Handles photo image URLs (Google Drive, Dropbox, Imgur, GitHub, missing protocols)
 * and external project/portfolio/certificate links.
 */

/**
 * Normalizes user-supplied photo image URLs so they render reliably in <img> tags.
 * Converts Google Drive share links, Dropbox links, Imgur page links, and GitHub avatars
 * into direct, embeddable image resources.
 */
export function normalizeImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  if (!url) return "";

  // Data URLs and blob URLs work natively
  if (url.startsWith("data:image/") || url.startsWith("blob:")) {
    return url;
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith("//")) {
      url = `https:${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. Google Drive direct link converter
    // Formats:
    // https://drive.google.com/file/d/{ID}/view...
    // https://drive.google.com/open?id={ID}
    // https://drive.google.com/uc?id={ID}
    if (host.includes("drive.google.com")) {
      let fileId = parsed.searchParams.get("id");
      if (!fileId) {
        const fileMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch?.[1]) {
          fileId = fileMatch[1];
        }
      }
      if (fileId) {
        // uc?export=view works reliably for public Google Drive images
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }

    // 2. Dropbox share link to direct image
    // https://www.dropbox.com/s/{id}/{name}?dl=0 -> ?raw=1
    if (host.includes("dropbox.com")) {
      parsed.searchParams.set("raw", "1");
      parsed.searchParams.delete("dl");
      return parsed.toString();
    }

    // 3. Imgur page URL to direct image
    // https://imgur.com/{id} -> https://i.imgur.com/{id}.png
    if (host === "imgur.com" || host === "m.imgur.com") {
      const imgurMatch = pathname.match(/^\/([a-zA-Z0-9]+)$/);
      if (imgurMatch?.[1] && !["a", "gallery", "upload"].includes(imgurMatch[1])) {
        return `https://i.imgur.com/${imgurMatch[1]}.png`;
      }
    }

    // 4. GitHub avatar or file
    // https://github.com/{username} -> https://github.com/{username}.png
    if (host === "github.com") {
      const userMatch = pathname.match(/^\/([a-zA-Z0-9-]+)\/?$/);
      const reserved = ["features", "pricing", "marketplace", "explore", "topics", "trending", "settings", "notifications"];
      if (userMatch?.[1] && !reserved.includes(userMatch[1].toLowerCase())) {
        return `https://github.com/${userMatch[1]}.png`;
      }
      // https://github.com/{owner}/{repo}/blob/{branch}/{path} -> raw.githubusercontent.com
      const blobMatch = pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
      if (blobMatch) {
        return `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}/${blobMatch[4]}`;
      }
    }

    // 5. Unsplash photo direct optimization if missing params
    if (host.includes("images.unsplash.com") && !parsed.searchParams.has("auto")) {
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", "400");
      parsed.searchParams.set("q", "80");
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    // If URL constructor fails, return fallback with https
    return url.startsWith("http") ? url : `https://${url}`;
  }
}

/**
 * Normalizes external links (project URLs, GitHub, LinkedIn, portfolio, credentials).
 * Ensures an absolute https:// or mailto: / tel: protocol exists so PDF export
 * generates clickable, working external hyperlinks rather than broken relative paths.
 */
export function normalizeLinkUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  if (!url) return "";

  if (url.startsWith("mailto:") || url.startsWith("tel:")) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return `https://${url}`;
}

/**
 * Strips protocol, www., and trailing slashes for clean, elegant display inside resume cards.
 * Example: "https://www.github.com/johndoe/project/" -> "github.com/johndoe/project"
 */
export function formatDisplayUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  return rawUrl
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/\/+$/, "");
}
