import { OrbitHandler } from './lib/client';
import { precompilesHandler } from './partial-handlers/precompiles';
import { rollupHandler } from './partial-handlers/rollup';
import 'dotenv/config';

if (
  !process.env.ORBIT_CHAIN_ID ||
  !process.env.ORBIT_CHAIN_RPC ||
  !process.env.PARENT_CHAIN_ID ||
  !process.env.ROLLUP_ADDRESS
) {
  throw new Error(
    `The following environmental variables are required: ORBIT_CHAIN_ID, ORBIT_CHAIN_RPC, PARENT_CHAIN_ID, ROLLUP_ADDRESS`,
  );
}

// Get the orbit handler
const orbitHandler = new OrbitHandler(
  Number(process.env.PARENT_CHAIN_ID),
  Number(process.env.ORBIT_CHAIN_ID),
  process.env.ORBIT_CHAIN_RPC,
);

const main = async () => {
  // Rollup information
  await rollupHandler(orbitHandler, process.env.ROLLUP_ADDRESS as `0x${string}`);

  // Precompiles information
  await precompilesHandler(orbitHandler);
};

// Calling main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
