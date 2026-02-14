/**
 * Evidence Tamper-Proofing Utilities
 *
 * SHA-256 hashing for uploaded evidence files to ensure integrity.
 * Generates a hash before upload and stores it alongside the file reference.
 */

/**
 * Compute SHA-256 hash of a File object.
 * Uses the Web Crypto API (SubtleCrypto) which is available in all modern browsers.
 */
export async function computeFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify a file's integrity against a stored hash.
 */
export async function verifyFileIntegrity(file: File, expectedHash: string): Promise<boolean> {
    const actualHash = await computeFileHash(file)
    return actualHash === expectedHash
}

/**
 * Generate a tamper-proof evidence metadata object.
 * This should be stored in the database alongside the file reference.
 */
export async function createEvidenceMetadata(file: File): Promise<{
    file_name: string
    file_size: number
    file_type: string
    sha256_hash: string
    hashed_at: string
}> {
    const hash = await computeFileHash(file)
    return {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        sha256_hash: hash,
        hashed_at: new Date().toISOString(),
    }
}

/**
 * Format a hash for display (truncated with ellipsis).
 */
export function formatHash(hash: string, chars: number = 8): string {
    if (hash.length <= chars * 2) return hash
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

/**
 * Generate a verification badge for display.
 */
export function getVerificationStatus(
    storedHash: string | null,
    currentHash?: string
): { status: 'verified' | 'tampered' | 'unverified'; label: string; color: string } {
    if (!storedHash) {
        return { status: 'unverified', label: 'No hash recorded', color: 'text-muted-foreground' }
    }
    if (!currentHash) {
        return { status: 'verified', label: 'Hash on file', color: 'text-blue-500' }
    }
    if (storedHash === currentHash) {
        return { status: 'verified', label: 'Integrity verified', color: 'text-green-500' }
    }
    return { status: 'tampered', label: 'INTEGRITY COMPROMISED', color: 'text-red-500' }
}
