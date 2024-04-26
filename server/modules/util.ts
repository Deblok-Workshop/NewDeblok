var endpoints: any = process.env.ENDPOINTS;
endpoints = endpoints.split(",");
async function ping(url: string): Promise<string> {
  try {
    let headers: { [key: string]: string } = {};
    headers.Authorization = getHTTPAuthHeader(url);
    const response = await fetch("http://" + url.split("@")[1] + "/", {
      verbose: true,
      headers: {
        Authorization: getHTTPAuthHeader(url),
        "Content-Type": "text/plain",
      },
    });
    if (response.status >= 200 && response.status < 400) {
      return "up";
    } else {
      return "down";
    }
  } catch (error) {
    console.error(error);
    return "down";
  }
}
async function getBacks() {
  let hc = (await healthcheck()).backend;
  for (let i = 0; i < hc.length; i++) {
    if (hc[i] == "up") {
      return endpoints[i];
    }
  }
  console.warn("WARN: No online DeblokManager server found");
  return null;
}
async function healthcheck() {
  let backendstat: any[] = [];
  for (let i = 0; i < endpoints.length; i++) {
    backendstat[backendstat.length] = await ping(endpoints[i]);
  }
  return { api: "up", backend: backendstat };
}

async function getBackPorts(server: string) {
  let hc = (await healthcheck()).backend;
  try {
    let res = await fetch("http://" + server + "/ports/list", {
      
      headers: { Authorization: getHTTPAuthHeader(server) },
    });
    return await res.json();
  } catch (e) {
    return e;
  }
}

function getHTTPAuthHeader(url: string) {
  // admin:admin@example.com
  if (url.includes("@")) {
    url = url.replaceAll("http://", "").replaceAll("https://", "");
    let auth = url.split("@")[0].split(":");
    return `Basic ${btoa(`${auth[0]}:${auth[1]}`)}`;
  } else {
    return "";
  }
}
export default { getBacks, getBackPorts, healthcheck, ping, getHTTPAuthHeader };
