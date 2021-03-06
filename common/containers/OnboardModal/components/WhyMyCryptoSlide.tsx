import React from 'react';
import translate from 'translations';
import OnboardSlide from './OnboardSlide';
import onboardIconSix from 'assets/images/onboarding/slide-06.svg';

const WhyMewSlide = () => {
  const header = translate('ONBOARD_whymyc_title');

  const content = (
    <ul>
      <li>{translate('ONBOARD_whymyc_content__1')}</li>
      <li>{translate('ONBOARD_whymyc_content__2')}</li>
      <li>{translate('ONBOARD_whymyc_content__3')}</li>
      <li>{translate('ONBOARD_whymyc_content__4')}</li>
      <li>{translate('ONBOARD_whymyc_content__5')}</li>
      <li>{translate('ONBOARD_whymyc_content__6')}</li>
    </ul>
  );
  return <OnboardSlide header={header} content={content} image={onboardIconSix} imageSide="left" />;
};
export default WhyMewSlide;
