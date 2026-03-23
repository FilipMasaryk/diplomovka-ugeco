#!/usr/bin/env bash
set -euo pipefail

BE_IMAGE=${BE_IMAGE:-ugeco-api}
FE_IMAGE=${FE_IMAGE:-ugeco-frontend}
PROXY_IMAGE=${PROXY_IMAGE:-ugeco-proxy}
IMAGE_TAG=${IMAGE_TAG:-v1.0}

BE_IMAGE_FILE=${BE_IMAGE_FILE:-be-image-${IMAGE_TAG}.tar}
FE_IMAGE_FILE=${FE_IMAGE_FILE:-fe-image-${IMAGE_TAG}.tar}
PROXY_IMAGE_FILE=${PROXY_IMAGE_FILE:-proxy-image-${IMAGE_TAG}.tar}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

#── Backend ──────────────────────────────────────────────────────────────────
# echo "=== Building BE image: ${BE_IMAGE}:${IMAGE_TAG} ==="
# docker build -t "${BE_IMAGE}:${IMAGE_TAG}" "${PROJECT_ROOT}/Backend"

# echo "=== Saving BE image to ${BE_IMAGE_FILE} ==="
# docker save "${BE_IMAGE}:${IMAGE_TAG}" -o "${BE_IMAGE_FILE}"


# ── Frontend ─────────────────────────────────────────────────────────────────
echo "=== Building FE image: ${FE_IMAGE}:${IMAGE_TAG} ==="
docker build \
  -f "${PROJECT_ROOT}/Frontend/Dockerfile" \
  -t "${FE_IMAGE}:${IMAGE_TAG}" \
  "${PROJECT_ROOT}"

echo "=== Saving FE image to ${FE_IMAGE_FILE} ==="
docker save "${FE_IMAGE}:${IMAGE_TAG}" -o "${FE_IMAGE_FILE}"

# ── Proxy ─────────────────────────────────────────────────────────────────────
echo "=== Building Proxy image: ${PROXY_IMAGE}:${IMAGE_TAG} ==="
docker build -t "${PROXY_IMAGE}:${IMAGE_TAG}" "${PROJECT_ROOT}/proxy"

echo "=== Saving Proxy image to ${PROXY_IMAGE_FILE} ==="
docker save "${PROXY_IMAGE}:${IMAGE_TAG}" -o "${PROXY_IMAGE_FILE}"

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "Done."
echo "BE:    ${BE_IMAGE}:${IMAGE_TAG}    ->  ${BE_IMAGE_FILE}"
echo "FE:    ${FE_IMAGE}:${IMAGE_TAG}  ->  ${FE_IMAGE_FILE}"
echo "Proxy: ${PROXY_IMAGE}:${IMAGE_TAG}   ->  ${PROXY_IMAGE_FILE}"
echo ""
echo "Copy with:"
echo "  scp -i ~/.ssh/salvoUniversal ${BE_IMAGE_FILE} devel@158.193.214.175:/home/devel/images"
echo "  scp -i ~/.ssh/salvoUniversal ${FE_IMAGE_FILE} devel@158.193.214.175:/home/devel/images"
echo "  scp -i ~/.ssh/salvoUniversal ${PROXY_IMAGE_FILE} devel@158.193.214.175:/home/devel/images"
echo ""
echo "Load with:"
echo "  docker load -i ${BE_IMAGE_FILE}"
echo "  docker load -i ${FE_IMAGE_FILE}"
echo "  docker load -i ${PROXY_IMAGE_FILE}"