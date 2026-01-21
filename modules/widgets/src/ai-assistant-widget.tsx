import {Deck, Widget, WidgetPlacement} from '@deck.gl/core';
import {UseAssistantProps} from '@openassistant/core';
import {AiAssistant, ConfigPanel} from '@openassistant/ui';
// import { ConfigPanel } from './config-panel';
import {createRoot} from 'react-dom/client';

import '@openassistant/ui/dist/index.css';
/**
 * The props for the AiAssistantWidget component.
 */
export type AiAssistantWidgetProps = {
  id?: string;
  /**
   * Widget positioning within the view. Default 'top-left'.
   */
  placement?: WidgetPlacement;
  /**
   * The width of the widget.
   */
  width?: number;
  /**
   * The height of the widget.
   */
  height?: number;
  /**
   * Opacity of the widget.
   */
  opacity?: number;
  /**
   * Theme of the widget.
   */
  theme?: 'light' | 'dark';
  /**
   * Whether to show the Model config panel. The Model config panel provides an interface
   * in the chat UI for users to select the model, enter apiKey, temperature, top P, and base URL.
   * If you use the config panel, then you don't need to provide the following props:
   * - modelProvider
   * - model
   * - apiKey
   */
  showConfigPanel?: boolean;
  /**
   * The name of the assistant.
   */
  assistantName?: string;
  /**
   * The API key for the assistant.
   */
  apiKey?: string;
  /**
   * The version of the assistant.
   */
  version?: string;
  /**
   * The model provider of the assistant.
   */
  modelProvider?: string;
  /**
   * The model of the assistant.
   */
  model?: string;
  /**
   * The welcome message of the assistant.
   */
  welcomeMessage?: string;
  /**
   * The instructions of the assistant.
   */
  instructions?: string;
  /**
   * The function tools of the assistant.
   */
  functionTools?: UseAssistantProps['functions'];
  /**
   * The temperature of the assistant.
   */
  temperature?: number;
  /**
   * The top P of the assistant.
   */
  topP?: number;
  /**
   * The base URL of the assistant.
   */
  baseUrl?: string;
  /**
   * The chat endpoint of the assistant. Use it when you setup a chat endpoint service.
   */
  chatEndpoint?: string;
  /**
   * The voice endpoint of the assistant. Use it when you setup a voice endpoint service.
   */
  voiceEndpoint?: string;
  /**
   * Whether to enable voice input.
   */
  enableVoice?: boolean;
};

export class AiAssistantWidget implements Widget<AiAssistantWidgetProps> {
  private root?: ReturnType<typeof createRoot>;

  id: string = 'ai-assistant-widget';
  element?: HTMLDivElement;
  deck?: Deck<any>;
  placement: WidgetPlacement = 'top-right';
  props: AiAssistantWidgetProps;

  constructor(options: AiAssistantWidgetProps) {
    if (options.placement) {
      this.placement = options.placement;
    }

    this.props = {
      width: options.width ?? 390,
      height: options.height ?? 800,
      opacity: options.opacity ?? 0.8,
      theme: options.theme ?? 'light',
      assistantName: options.assistantName ?? 'My Assistant',
      apiKey: options.apiKey ?? '',
      version: options.version ?? 'v1',
      modelProvider: options.modelProvider ?? 'openai',
      model: options.model ?? 'gpt-4o',
      welcomeMessage: options.welcomeMessage ?? 'Hello, how can I help you today?',
      temperature: options.temperature ?? 0.5,
      topP: options.topP ?? 1.0,
      baseUrl: options.baseUrl ?? '',
      chatEndpoint: options.chatEndpoint ?? '',
      voiceEndpoint: options.voiceEndpoint ?? '',
      instructions: options.instructions ?? '',
      functionTools: options.functionTools ?? [],
      showConfigPanel: options.showConfigPanel ?? true,
      enableVoice: options.enableVoice ?? true
    };
  }

  onAdd({deck}: {deck: Deck<any>}) {
    const el = document.createElement('div');
    el.className = 'ai-assistant-widget';
    el.style.pointerEvents = 'auto';

    // stop propagation of scroll and touch events to map (zoom, pan)
    el.addEventListener(
      'wheel',
      e => {
        e.stopPropagation();
      },
      {passive: false}
    );

    el.addEventListener(
      'touchstart',
      e => {
        e.stopPropagation();
      },
      {passive: false}
    );

    this.element = el;
    this.deck = deck;
    this.root = createRoot(el);

    this.update();

    return el;
  }

  private update() {
    const element = this.element;
    if (!element || !this.root) {
      return;
    }

    const ui = (
      <div
        style={{
          width: `${this.props.width}px`,
          height: `${this.props.height}px`,
          opacity: this.props.opacity,
          margin: '16px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }}
      >
        <AiAssistant
          name={this.props.assistantName}
          apiKey={this.props.apiKey}
          version={this.props.version}
          modelProvider={this.props.modelProvider}
          model={this.props.model}
          welcomeMessage={this.props.welcomeMessage}
          instructions={this.props.instructions}
          functions={this.props.functionTools}
          temperature={this.props.temperature}
          topP={this.props.topP}
          baseUrl={this.props.baseUrl}
          chatEndpoint={this.props.chatEndpoint}
          enableVoice={this.props.enableVoice}
          voiceEndpoint={this.props.voiceEndpoint}
          theme={this.props.theme}
          historyMessages={
            this.props.showConfigPanel
              ? [
                  {
                    message: this.props.welcomeMessage,
                    direction: 'incoming',
                    position: 'single'
                  },
                  {
                    message:
                      'Please select your prefered LLM model and use your API key to start the chat.',
                    direction: 'incoming',
                    position: 'single',
                    payload: (
                      <div style={{marginTop: '16px'}}>
                        <ConfigPanel
                          initialConfig={{
                            isReady: false,
                            provider: this.props.modelProvider,
                            model: this.props.model,
                            apiKey: this.props.apiKey,
                            temperature: this.props.temperature,
                            topP: this.props.topP
                          }}
                          onConfigChange={(config: AiAssistantConfig) => {
                            this.props.modelProvider = config.provider;
                            this.props.model = config.model;
                            this.props.apiKey = config.apiKey;
                            this.props.temperature = config.temperature;
                            this.props.topP = config.topP;
                            this.props.baseUrl = config.baseUrl || '';
                          }}
                        />
                      </div>
                    )
                  }
                ]
              : []
          }
        />
      </div>
    );

    this.root.render(ui);
  }
}
