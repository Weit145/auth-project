#!/bin/sh

set -eu

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
secrets_dir="$root_dir/secrets"
required_files="
ca.crt
ca.key
client.crt
client.key
jwt_private.pem
jwt_public.pem
server.crt
server.key
"

for file in $required_files; do
	if [ ! -s "$secrets_dir/$file" ]; then
		missing=true
		break
	fi
done

if [ "${missing:-false}" = false ]; then
	exit 0
fi

mkdir -p "$secrets_dir"
tmp_dir=$(mktemp -d "$secrets_dir/.generate.XXXXXX")
trap 'rm -rf "$tmp_dir"' EXIT INT TERM

openssl genrsa -out "$tmp_dir/ca.key" 4096
openssl req -x509 -new -sha256 -days 3650 \
	-key "$tmp_dir/ca.key" \
	-subj "/CN=startup-local-mtls-ca" \
	-out "$tmp_dir/ca.crt"

openssl genrsa -out "$tmp_dir/server.key" 2048
openssl req -new \
	-key "$tmp_dir/server.key" \
	-subj "/CN=auth" \
	-out "$tmp_dir/server.csr"
printf '%s\n' \
	'subjectAltName=DNS:auth' \
	'extendedKeyUsage=serverAuth' \
	>"$tmp_dir/server.ext"
openssl x509 -req -sha256 -days 825 \
	-in "$tmp_dir/server.csr" \
	-CA "$tmp_dir/ca.crt" \
	-CAkey "$tmp_dir/ca.key" \
	-CAcreateserial \
	-extfile "$tmp_dir/server.ext" \
	-out "$tmp_dir/server.crt"

openssl genrsa -out "$tmp_dir/client.key" 2048
openssl req -new \
	-key "$tmp_dir/client.key" \
	-subj "/CN=gateway" \
	-out "$tmp_dir/client.csr"
printf '%s\n' 'extendedKeyUsage=clientAuth' >"$tmp_dir/client.ext"
openssl x509 -req -sha256 -days 825 \
	-in "$tmp_dir/client.csr" \
	-CA "$tmp_dir/ca.crt" \
	-CAkey "$tmp_dir/ca.key" \
	-CAcreateserial \
	-extfile "$tmp_dir/client.ext" \
	-out "$tmp_dir/client.crt"

openssl genrsa -out "$tmp_dir/jwt_private.pem" 2048
openssl rsa \
	-in "$tmp_dir/jwt_private.pem" \
	-pubout \
	-out "$tmp_dir/jwt_public.pem"

chmod 600 \
	"$tmp_dir/ca.key" \
	"$tmp_dir/client.key" \
	"$tmp_dir/jwt_private.pem" \
	"$tmp_dir/server.key"
chmod 644 \
	"$tmp_dir/ca.crt" \
	"$tmp_dir/client.crt" \
	"$tmp_dir/jwt_public.pem" \
	"$tmp_dir/server.crt"

for file in $required_files; do
	mv "$tmp_dir/$file" "$secrets_dir/$file"
done

echo "Generated local development certificates and JWT keys in secrets/"
