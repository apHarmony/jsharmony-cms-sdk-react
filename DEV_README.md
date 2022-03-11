# Building (Development)

1. run `npm install`
2. run `npm run build:watch`

# Building (Production)

1. run `npm install`
2. run `npm run build:prod`


# Output

All build output is located in `dist/`.

# Publishing

1. set the version number in `package.dist.json`
2. follow instruction for the [production build](#Building-\(Production\))
3. go to `dist/` and run `npm publish`