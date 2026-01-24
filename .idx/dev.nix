{ pkgs, ... }: {
  # Channel handles which nixpkgs revision to use.
  channel = "stable-23.11";

  # Use standard packages
  packages = [
    pkgs.nodejs_20
  ];

  # Sets environment variables in the workspace
  env = {
    # SUPABASE_DB_URL = "postgres://postgres.gxzsxvbercpkgxraiaex:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "mcp.mcp-inspector"
    ];

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install = "npm install && cd src/mcp && npm install";
      };
      # Runs when a workspace is (re)started
      onStart = {
        # compile-mcp = "cd src/mcp && npm run build";
      };
    };

    # MCP Services configuration
    services.mcp = {
      enable = true;
      servers = {
        icaffeos = {
          command = [ "npm" "--prefix" "src/mcp" "start" ];
          env = {
            # Inherits from top-level env or can be overridden here
          };
        };
      };
    };

    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
          manager = "web";
        };
      };
    };
  };
}
