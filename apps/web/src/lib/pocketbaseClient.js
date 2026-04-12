import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = (
    import.meta.env.VITE_POCKETBASE_URL ||
    'http://pb.carrvin.com'
).replace(/\/$/, '');

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };

