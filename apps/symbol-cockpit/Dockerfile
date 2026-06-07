FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY modules ./modules
COPY apps/symbol-cockpit ./apps/symbol-cockpit
RUN npm ci --workspaces --include-workspace-root=false
RUN npm --workspace @tradeos/public-intel-sdk run build
RUN npm --workspace @tradeos/cockpit-core run build
RUN npm --workspace @tradeos/policy-core run build
RUN npm --workspace @tradeos/tradeos-connectors run build
RUN npm --workspace @tradeos/module-feasibility run build
RUN npm --workspace @tradeos/module-ea-risk run build
RUN npm --workspace @tradeos/module-execution-gateway run build
RUN npm --workspace @tradeos/module-ops-dashboard run build
RUN npm --workspace @tradeos/module-notification-router run build
RUN npm --workspace @tradeos/symbol-cockpit run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/modules ./modules
COPY --from=build /app/apps/symbol-cockpit ./apps/symbol-cockpit
WORKDIR /app/apps/symbol-cockpit
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.COCKPIT_API_PORT||18100)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/api/server.js"]

