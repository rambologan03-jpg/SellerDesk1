{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [ pkgs.nodejs_20 ];
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = ["npm" "run" "dev" "--" "--port" "3000" "--host" "0.0.0.0"];
        manager = "web";
      };
    };
  };
}