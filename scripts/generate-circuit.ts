/**
 * Generate zk-SNARK Circuit
 * Compiles Circom circuit and generates trusted setup
 * 
 * Usage: npx tsx scripts/generate-circuit.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CIRCUIT_DIR = path.join(process.cwd(), 'circuits');
const CIRCUIT_NAME = 'metabolic-range-proof';
const CIRCUIT_FILE = path.join(CIRCUIT_DIR, `${CIRCUIT_NAME}.circom`);
const BUILD_DIR = path.join(CIRCUIT_DIR, 'build');

async function main() {
  console.log('🔧 Generating zk-SNARK Circuit...\n');

  // Check if circuit file exists
  if (!fs.existsSync(CIRCUIT_FILE)) {
    console.error(`❌ Circuit file not found: ${CIRCUIT_FILE}`);
    process.exit(1);
  }

  // Create build directory
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  try {
    // Step 1: Compile circuit
    console.log('📦 Compiling Circom circuit...');
    execSync(
      `circom ${CIRCUIT_FILE} --r1cs --wasm --sym -o ${BUILD_DIR}`,
      { stdio: 'inherit', cwd: process.cwd() }
    );
    console.log('✅ Circuit compiled successfully\n');

    // Step 2: Generate witness (requires input file)
    console.log('📝 Generating witness...');
    const inputFile = path.join(BUILD_DIR, 'input.json');
    const witnessFile = path.join(BUILD_DIR, 'witness.wtns');
    
    // Create sample input file if it doesn't exist
    if (!fs.existsSync(inputFile)) {
      const sampleInput = {
        biomarkerValue: 5.2,
        lowerBound: 0,
        upperBound: 5.7,
      };
      fs.writeFileSync(inputFile, JSON.stringify(sampleInput, null, 2));
      console.log('📄 Created sample input.json');
    }

    execSync(
      `node ${BUILD_DIR}/${CIRCUIT_NAME}_js/generate_witness.js ${BUILD_DIR}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm ${inputFile} ${witnessFile}`,
      { stdio: 'inherit', cwd: process.cwd() }
    );
    console.log('✅ Witness generated successfully\n');

    // Step 3: Trusted setup (Phase 1 - Powers of Tau)
    console.log('🔐 Starting trusted setup (Phase 1)...');
    console.log('⚠️  Note: For production, use Perpetual Powers of Tau ceremony');
    console.log('   See: https://github.com/iden3/snarkjs#7-prepare-phase-2');
    
    const ptauFile = path.join(BUILD_DIR, 'powersOfTau28_hez_final.ptau');
    
    // Download powers of tau if not exists (for testing)
    if (!fs.existsSync(ptauFile)) {
      console.log('📥 Downloading Powers of Tau file...');
      console.log('   (This is a large file, ~800MB)');
      console.log('   For production, use the Perpetual Powers of Tau ceremony');
      // In production, download from: https://github.com/iden3/snarkjs#7-prepare-phase-2
    }

    // Step 4: Generate proving key and verification key
    console.log('\n🔑 Generating proving and verification keys...');
    const r1csFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}.r1cs`);
    const provingKeyFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}_proving_key.zkey`);
    const verificationKeyFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}_verification_key.json`);

    if (fs.existsSync(ptauFile)) {
      execSync(
        `snarkjs groth16 setup ${r1csFile} ${ptauFile} ${provingKeyFile}`,
        { stdio: 'inherit', cwd: process.cwd() }
      );

      execSync(
        `snarkjs groth16 export verificationkey ${provingKeyFile} ${verificationKeyFile}`,
        { stdio: 'inherit', cwd: process.cwd() }
      );
      console.log('✅ Keys generated successfully\n');
    } else {
      console.log('⚠️  Skipping key generation (Powers of Tau file not found)');
      console.log('   Run this manually after downloading Powers of Tau:\n');
      console.log(`   snarkjs groth16 setup ${r1csFile} <ptau_file> ${provingKeyFile}`);
      console.log(`   snarkjs groth16 export verificationkey ${provingKeyFile} ${verificationKeyFile}\n`);
    }

    // Step 5: Generate proof (test)
    if (fs.existsSync(provingKeyFile) && fs.existsSync(witnessFile)) {
      console.log('🧪 Generating test proof...');
      const proofFile = path.join(BUILD_DIR, 'proof.json');
      const publicFile = path.join(BUILD_DIR, 'public.json');

      execSync(
        `snarkjs groth16 prove ${provingKeyFile} ${witnessFile} ${proofFile} ${publicFile}`,
        { stdio: 'inherit', cwd: process.cwd() }
      );
      console.log('✅ Test proof generated successfully\n');

      // Step 6: Verify proof
      console.log('✅ Verifying proof...');
      execSync(
        `snarkjs groth16 verify ${verificationKeyFile} ${publicFile} ${proofFile}`,
        { stdio: 'inherit', cwd: process.cwd() }
      );
      console.log('✅ Proof verified successfully\n');
    }

    // Step 7: Generate Solidity verifier
    if (fs.existsSync(verificationKeyFile)) {
      console.log('📄 Generating Solidity verifier contract...');
      const verifierFile = path.join(BUILD_DIR, 'Verifier.sol');
      execSync(
        `snarkjs groth16 export solidityverifier ${provingKeyFile} ${verifierFile}`,
        { stdio: 'inherit', cwd: process.cwd() }
      );
      console.log('✅ Solidity verifier generated successfully\n');
      console.log(`📁 Verifier contract: ${verifierFile}`);
    }

    console.log('\n✨ Circuit generation complete!');
    console.log(`📁 Build directory: ${BUILD_DIR}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Review the generated Verifier.sol contract');
    console.log('   2. Deploy the verifier contract to Base network');
    console.log('   3. Update ZkProofVerifier.sol to use the deployed verifier');
    console.log('   4. Update lib/crypto/zk-proofs.ts to use the proving key\n');

  } catch (error: unknown) {
    console.error('\n❌ Error generating circuit:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\n💡 Make sure you have installed:');
    console.error('   - circom: npm install -g circom');
    console.error('   - snarkjs: npm install -g snarkjs');
    console.error('   - circomlib: npm install circomlib');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});













