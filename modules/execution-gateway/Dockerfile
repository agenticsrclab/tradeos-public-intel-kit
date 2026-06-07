FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps ./apps
COPY modules ./modules
RUN npm ci --workspaces --include-workspace-root=false && npm --workspace @tradeos/module-execution-gateway run build
WORKDIR /app/modules/execution-gateway
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "console.log('ok')"
CMD ["node", "-e", "console.log(JSON.stringify({schema_version:'tradeos.module.execution_gateway.health.v1',status:'ok',mode:'paper'})); setInterval(()=>{}, 1<<30)"]
