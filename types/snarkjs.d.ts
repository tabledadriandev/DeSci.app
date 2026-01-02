declare module 'snarkjs' {
  export interface Groth16Proof {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
    protocol: string;
    curve: string;
  }

  export interface Groth16PublicSignals {
    [key: string]: string;
  }

  export interface Groth16 {
    fullProve(
      input: Record<string, unknown>,
      wasmPath: string,
      zkeyPath: string
    ): Promise<{
      proof: Groth16Proof;
      publicSignals: string[];
    }>;
    verify(
      vkey: any,
      publicSignals: string[],
      proof: Groth16Proof
    ): Promise<boolean>;
  }

  export const groth16: Groth16;
}

