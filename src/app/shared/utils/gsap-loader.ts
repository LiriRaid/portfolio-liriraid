type GsapModule = typeof import('gsap');
export type GsapInstance = GsapModule['gsap'];

let cachedGsap: GsapInstance | null = null;
let pendingPromise: Promise<GsapInstance> | null = null;

export async function loadGsap(): Promise<GsapInstance> {
  if (cachedGsap) {
    return cachedGsap;
  }

  if (!pendingPromise) {
    pendingPromise = import('gsap').then((mod) => {
      cachedGsap = mod.gsap;
      return cachedGsap;
    });
  }

  return pendingPromise;
}

export function getGsapSync(): GsapInstance | null {
  return cachedGsap;
}
