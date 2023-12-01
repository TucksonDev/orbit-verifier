import { OrbitHandler } from './lib/client';
import { precompilesHandler } from './partial-handlers/precompiles';
import { rollupHandler } from './partial-handlers/rollup';

//
// Parameters
//  (TODO: better handle parameters: .env, cli arguments, ...)
//
const orbitChainId = 0;
const orbitChainRpc = '';
const parentChainId = 421613;
const rollupAddress = '0x';

// Get the orbit handler
const orbitHandler = new OrbitHandler(parentChainId, orbitChainId, orbitChainRpc);

const main = async () => {
  // Rollup information
  await rollupHandler(orbitHandler, rollupAddress);

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
