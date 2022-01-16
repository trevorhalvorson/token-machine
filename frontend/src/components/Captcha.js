import React from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export function Captcha({ onRef, onVerify, onExpire }) {
  return (
    <form>
      <HCaptcha
        ref={(r) => onRef(r)}
        sitekey={process.env.REACT_APP_HCAPTCHA_SITE_KEY}
        onVerify={onVerify}
        onExpire={onExpire}
      />
    </form>
  );
}
