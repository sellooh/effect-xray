{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    sst-mac-arm64 = {
      url = "file+https://github.com/sst/ion/releases/download/v0.0.489/sst-mac-arm64.tar.gz";
      flake = false;
    };
    sst-mac-x86_64 = {
      url = "file+https://github.com/sst/ion/releases/download/v0.0.489/sst-mac-x86_64.tar.gz";
      flake = false;
    };
    sst-linux-arm64 = {
      url = "file+https://github.com/sst/ion/releases/download/v0.0.489/sst-linux-arm64.tar.gz";
      flake = false;
    };
    sst-linux-x86_64 = {
      url = "file+https://github.com/sst/ion/releases/download/v0.0.489/sst-mac-x86_64.tar.gz";
      flake = false;
    };
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    , sst-mac-arm64
    , sst-mac-x86_64
    , sst-linux-arm64
    , sst-linux-x86_64
    , ...
    }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
      };

      sst-vendor =
        if pkgs.stdenv.isLinux then
          if pkgs.stdenv.isAarch64 then sst-linux-arm64
          else sst-linux-x86_64
        else
          if pkgs.stdenv.isAarch64 then sst-mac-arm64
          else sst-mac-x86_64;

      sst = pkgs.stdenv.mkDerivation {
        name = "sst";
        version = "0.1.0";
        src = ./.;
        buildInputs = [ ];
        buildPhase = ''
          runHook preBuild

          # copy sst
          cp -r ${sst-vendor} ./sst.tar.gz

          # untar sst
          tar -xvzf ./sst.tar.gz

          runHook postBuild
        '';
        installPhase = ''
          runHook preInstall
          # Note: you need some sort of `mkdir` on $out for any of the following commands to work
          mkdir -p $out/bin

          # no wrapper
          cp ./sst $out/bin/sst

          chmod a+x $out/bin/sst
          runHook postInstall
        '';
      };
    in
    with pkgs;
    {
      packages =
        {
          inherit sst;
          default = sst;
        };
      devShells.default = mkShell {
        shellHook = ''
        '';
        buildInputs = [
          sst
          unzip
          git
          awscli2
          nodejs_20
          bun
        ];
      };
    }
    );
}

