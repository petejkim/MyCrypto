import React from 'react';
import Slider from 'rc-slider';
import translate, { translateRaw } from 'translations';
import { gasPriceDefaults } from 'config';
import FeeSummary from './FeeSummary';
import './SimpleGas.scss';
import { AppState } from 'reducers';
import {
  getGasLimitEstimationTimedOut,
  getGasEstimationPending,
  nonceRequestPending
} from 'selectors/transaction';
import { connect } from 'react-redux';
import { fetchGasEstimates, TFetchGasEstimates } from 'actions/gas';
import { getIsWeb3Node } from 'selectors/config';
import { getEstimates, getIsEstimating } from 'selectors/gas';
import { Wei, fromWei } from 'libs/units';
import { InlineSpinner } from 'components/ui/InlineSpinner';
const SliderWithTooltip = Slider.createSliderWithTooltip(Slider);

interface OwnProps {
  gasPrice: AppState['transaction']['fields']['gasPrice'];
  inputGasPrice(rawGas: string);
  setGasPrice(rawGas: string);
}

interface StateProps {
  gasEstimates: AppState['gas']['estimates'];
  isGasEstimating: AppState['gas']['isEstimating'];
  noncePending: boolean;
  gasLimitPending: boolean;
  isWeb3Node: boolean;
  gasLimitEstimationTimedOut: boolean;
}

interface ActionProps {
  fetchGasEstimates: TFetchGasEstimates;
}

type Props = OwnProps & StateProps & ActionProps;

class SimpleGas extends React.Component<Props> {
  public componentDidMount() {
    this.fixGasPrice(this.props.gasPrice);
    this.props.fetchGasEstimates();
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (!this.props.gasEstimates && nextProps.gasEstimates) {
      this.props.setGasPrice(nextProps.gasEstimates.fast.toString());
    }
  }

  public render() {
    const {
      isGasEstimating,
      gasEstimates,
      gasPrice,
      gasLimitEstimationTimedOut,
      isWeb3Node,
      noncePending,
      gasLimitPending
    } = this.props;

    const bounds = {
      max: gasEstimates ? gasEstimates.fastest : gasPriceDefaults.minGwei,
      min: gasEstimates ? gasEstimates.safeLow : gasPriceDefaults.maxGwei
    };

    return (
      <div className="SimpleGas row form-group">
        <div className="SimpleGas-title">
          <div className="flex-wrapper">
            <label>{translateRaw('Transaction Fee')} </label>
            <div className="flex-spacer" />
            <InlineSpinner active={noncePending || gasLimitPending} text="Calculating" />
          </div>
        </div>

        {gasLimitEstimationTimedOut && (
          <div className="prompt-toggle-gas-limit">
            <p className="small">
              {isWeb3Node
                ? "Couldn't calculate gas limit, if you know what you're doing, try setting manually in Advanced settings"
                : "Couldn't calculate gas limit, try switching nodes"}
            </p>
          </div>
        )}

        <div className="SimpleGas-input-group">
          <div className="SimpleGas-slider">
            <SliderWithTooltip
              onChange={this.handleSlider}
              min={bounds.min}
              max={bounds.max}
              value={this.getGasPriceGwei(gasPrice.value)}
              tipFormatter={this.formatTooltip}
              disabled={isGasEstimating}
            />
            <div className="SimpleGas-slider-labels">
              <span>{translate('Cheap')}</span>
              <span>{translate('Fast')}</span>
            </div>
          </div>
          <FeeSummary
            gasPrice={gasPrice}
            render={({ fee, usd }) => (
              <span>
                {fee} {usd && <span>/ ${usd}</span>}
              </span>
            )}
          />
        </div>
      </div>
    );
  }

  private handleSlider = (gasGwei: number) => {
    this.props.inputGasPrice(gasGwei.toString());
  };

  private fixGasPrice(gasPrice: AppState['transaction']['fields']['gasPrice']) {
    // If the gas price is above or below our minimum, bring it in line
    const gasPriceGwei = this.getGasPriceGwei(gasPrice.value);
    if (gasPriceGwei > gasPriceDefaults.maxGwei) {
      this.props.setGasPrice(gasPriceDefaults.maxGwei.toString());
    } else if (gasPriceGwei < gasPriceDefaults.minGwei) {
      this.props.setGasPrice(gasPriceDefaults.minGwei.toString());
    }
  }

  private getGasPriceGwei(gasPriceValue: Wei) {
    return parseFloat(fromWei(gasPriceValue, 'gwei'));
  }

  private formatTooltip = (gas: number) => {
    const { gasEstimates } = this.props;
    let recommended = '';
    if (gasEstimates && !gasEstimates.isDefault && gas === gasEstimates.fast) {
      recommended = '(Recommended)';
    }

    return `${gas} Gwei ${recommended}`;
  };
}

export default connect(
  (state: AppState): StateProps => ({
    gasEstimates: getEstimates(state),
    isGasEstimating: getIsEstimating(state),
    noncePending: nonceRequestPending(state),
    gasLimitPending: getGasEstimationPending(state),
    gasLimitEstimationTimedOut: getGasLimitEstimationTimedOut(state),
    isWeb3Node: getIsWeb3Node(state)
  }),
  {
    fetchGasEstimates
  }
)(SimpleGas);
