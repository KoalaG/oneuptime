# Set the package name and version
package_name=$PACKAGE_NAME
package_version=$PACKAGE_VERSION

# If no package name is provided, exit
if [ -z "$package_name" ]; then
  echo "Package name is required"
  exit 1
fi

# If no package version is provided, exit
if [ -z "$package_version" ]; then
  echo "Package version is required"
  exit 1
fi

# touch npmrc file
touch ~/.npmrc

# Add Auth Token to npmrc file
echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc

# Run npm install
npm install

# Run npm compile
npm run compile

# Publish the package
npm publish --tag latest

# Tag the package with the specified version
npm dist-tag add $package_name@$package_version latest

# Logout from npm
npm logout