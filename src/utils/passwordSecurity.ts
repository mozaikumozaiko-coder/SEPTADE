async function sha1Hash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

export async function checkPasswordBreached(password: string): Promise<boolean> {
  try {
    const hash = await sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      console.warn('Failed to check password breach status');
      return false;
    }

    const text = await response.text();
    const hashes = text.split('\n');

    for (const line of hashes) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix === suffix) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking password breach:', error);
    return false;
  }
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含める必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含める必要があります');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('数字を含める必要があります');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function validatePassword(password: string): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const strengthCheck = validatePasswordStrength(password);

  if (!strengthCheck.isValid) {
    return strengthCheck;
  }

  const isBreached = await checkPasswordBreached(password);

  if (isBreached) {
    return {
      isValid: false,
      errors: ['このパスワードは過去のデータ漏洩で公開されています。別のパスワードを使用してください。']
    };
  }

  return {
    isValid: true,
    errors: []
  };
}
