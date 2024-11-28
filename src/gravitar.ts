import md5 from 'md5';

export default function gravatar(
  email: string | undefined,
  name: string | undefined,
  size = 100,
) {
  const uiAvatarUrl = new URL('https://ui-avatars.com/api');
  if (name) {
    uiAvatarUrl.searchParams.append('name', name || '');
    uiAvatarUrl.searchParams.append('size', size.toString());
  }

  if (email) {
    const hash = md5(email);

    const gravitarUrl = new URL(`https://www.gravatar.com/avatar/${hash}`);
    gravitarUrl.searchParams.append('s', size.toString());

    if (name) {
      gravitarUrl.searchParams.append('d', uiAvatarUrl.toString());
    }

    return gravitarUrl.toString();
  }

  if (name) {
    return uiAvatarUrl.toString();
  }

  return '';
}
