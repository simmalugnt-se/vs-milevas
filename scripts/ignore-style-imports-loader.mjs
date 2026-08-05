const styleExtensions = new Set([".css", ".sass", ".scss"]);

function isStyleURL(url) {
  try {
    const { pathname } = new URL(url);
    return styleExtensions.has(pathname.slice(pathname.lastIndexOf(".")));
  } catch {
    return false;
  }
}

export async function load(url, context, nextLoad) {
  if (isStyleURL(url)) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default {};",
    };
  }

  return nextLoad(url, context);
}
