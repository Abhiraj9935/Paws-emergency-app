# PAWS Gemini image assessment gateway (no Node.js install required)

This Cloudflare Worker keeps the Gemini API key on the server. The static PAWS website calls the Worker only after a person clicks **Assess detected dog with Gemini**. It does not stream every camera frame to Gemini.

## 1. Get a Gemini API key
1. Open Google AI Studio: https://aistudio.google.com/apikey
2. Create an API key for the Gemini API.
3. Treat it like a password. Do not paste it into `app.js`, `gemini-config.js`, or any browser-side file.

Gemini API usage may be subject to quotas and charges. Check the terms and pricing for your account.

## 2. Deploy the Worker without installing Node.js
1. Create/sign in to a Cloudflare account: https://dash.cloudflare.com/
2. Open **Workers & Pages** and create a Worker.
3. Paste the contents of `worker.js` into the Worker editor and deploy it.
4. In the Worker settings, add a secret named `GEMINI_API_KEY` and paste the key there. Do not put the key in source code.
5. Optional variable: `GEMINI_MODEL` (defaults to `gemini-2.5-flash`). Use a model name enabled for your Gemini API project.
6. Redeploy if the dashboard asks you to.
7. Copy the deployed Worker HTTPS URL.

Cloudflare dashboard UI labels may change. The Worker is standard web JavaScript; no local Node.js installation or build command is needed.

## 3. Connect PAWS
Open `gemini-config.js` and replace the empty value with your deployed Worker URL, e.g.:

```js
window.PAWS_GEMINI_GATEWAY_URL = "https://your-worker-name.your-subdomain.workers.dev";
```

Save the file, reload PAWS from VS Code Live Server, start the camera, let it detect a dog, and click **Assess detected dog with Gemini**. The result is based on a single cropped photo of the detected dog.

## Security before public launch
This starter Worker allows cross-origin requests so localhost testing works. CORS is not authentication. Before publishing to the public, add Cloudflare rate limiting and an abuse-control/authentication check, restrict accepted origins to your real PAWS domain, and monitor usage. Do not let an unauthenticated public endpoint spend your API quota without controls. Never put the Gemini key in client-side code.

## Limitations
- COCO-SSD detects the object class `dog`; it does not itself detect injury.
- Gemini provides a probabilistic visual assessment, not a veterinary diagnosis. A single image cannot reliably establish internal injury, pain, or whether an animal is limping.
- The user must verify the result. The tool does not automatically dispatch SOS or send SMS.
- Images are sent to Google's Gemini API for processing. Review applicable privacy terms before using real rescue cases.
