import axios from 'axios';

const JARVIS_API_BASE = 'https://api.jarvislabs.ai/v1';

export interface JarvisInstance {
  instance_id: number;
  status: 'Running' | 'Paused' | 'Creating' | 'Deleting';
  url: string;
  ip: string;
}

/**
 * Utility to manage Jarvislabs.ai GPU instances programmatically.
 */
export const jarvis = {
  /**
   * Resumes a paused instance.
   */
  async resume(instanceId: string | number) {
    const apiKey = process.env.JARVISLABS_API_KEY;
    if (!apiKey) throw new Error('JARVISLABS_API_KEY is not configured');

    try {
      const response = await axios.put(
        `${JARVIS_API_BASE}/instances/${instanceId}?action=resume`,
        {},
        {
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[Jarvis/Resume] Error:', error.response?.data || error.message);
      throw new Error(`Failed to resume Jarvis instance: ${error.response?.data?.text || error.message}`);
    }
  },

  /**
   * Pauses a running instance to save credits.
   */
  async pause(instanceId: string | number) {
    const apiKey = process.env.JARVISLABS_API_KEY;
    if (!apiKey) throw new Error('JARVISLABS_API_KEY is not configured');

    try {
      const response = await axios.put(
        `${JARVIS_API_BASE}/instances/${instanceId}?action=pause`,
        {},
        {
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('[Jarvis/Pause] Error:', error.response?.data || error.message);
      throw new Error(`Failed to pause Jarvis instance: ${error.response?.data?.text || error.message}`);
    }
  },

  /**
   * Gets the current status of an instance.
   */
  async getStatus(instanceId: string | number): Promise<JarvisInstance> {
    const apiKey = process.env.JARVISLABS_API_KEY;
    if (!apiKey) throw new Error('JARVISLABS_API_KEY is not configured');

    try {
      const response = await axios.get(`${JARVIS_API_BASE}/instances`, {
        headers: {
          'X-API-KEY': apiKey,
        },
      });

      const instances = response.data as JarvisInstance[];
      const target = instances.find((inst) => inst.instance_id.toString() === instanceId.toString());

      if (!target) {
        throw new Error(`Instance ${instanceId} not found in your account.`);
      }

      return target;
    } catch (error: any) {
      console.error('[Jarvis/Status] Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Jarvis status: ${error.response?.data?.text || error.message}`);
    }
  },

  /**
   * Waits for the instance to be 'Running' and the URL to be reachable.
   */
  async waitForReady(instanceId: string | number, maxAttempts = 20): Promise<string> {
    console.log(`[Jarvis] Waiting for instance ${instanceId} to be ready...`);
    
    for (let i = 0; i < maxAttempts; i++) {
      const instance = await this.getStatus(instanceId);
      
      if (instance.status === 'Running') {
        const url = instance.url || `https://${instance.instance_id}.proxy.jarvislabs.net`;
        console.log(`[Jarvis] Instance is Running. Checking visibility at ${url}...`);
        
        try {
          // Heartbeat check
          const hb = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
          if (hb.ok) return url;
        } catch (e) {
          console.log(`[Jarvis] Instance active but API not yet responding (Attempt ${i + 1}/${maxAttempts})...`);
        }
      } else if (instance.status === 'Paused') {
        console.log(`[Jarvis] Instance is Paused. Sending resume command...`);
        await this.resume(instanceId);
      } else {
        console.log(`[Jarvis] Instance status: ${instance.status} (Attempt ${i + 1}/${maxAttempts})...`);
      }

      // Wait 10 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    throw new Error('Jarvis instance failed to become ready in time.');
  }
};
