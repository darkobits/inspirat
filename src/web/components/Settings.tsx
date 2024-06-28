import React from 'react';
import {
  Col,
  Form,
  Row
} from 'react-bootstrap';

import { AnimatedModal } from 'web/components/AnimatedModal';
import InspiratContext from 'web/contexts/Inspirat';

import type { GenericFunction } from 'web/etc/types';

export interface SettingsProps {
  show: boolean | undefined;
  onClose?: GenericFunction | undefined;
}

export function Settings({ show, onClose }: SettingsProps) {
  const { name, setName } = React.useContext(InspiratContext);

  return (
    <AnimatedModal
      data-testid="Settings"
      className="
        grow bg-slate-800 text-slate-100 p-4 m-8 rounded-lg shadow-2xl
        max-w-[640px]
      "
      show={show}
      onClose={onClose}
      body={
        <>
          <div className="flex flex-row items-end justify-between">
            <h1
              className="
                font-display font-extralight font-stretch-110%
                text-2xl tracking-wider
              "
            >
              Inspirat
            </h1>
            <h6 className="text-slate-400 font-display font-thin font-stretch-110% tracking-wide">
              {import.meta.env.GIT_DESC}
            </h6>
          </div>

          <hr className="border-slate-700 mt-3 mb-4" />

          <Form
            noValidate
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
            }}
          >
            <Form.Group as={Row} controlId="name">
              <Col
                className="text-slate-400"
                sm={{ span: 10, offset: 1 }}
                lg={{ span: 8, offset: 2 }}
              >
                <Form.Label
                  column="lg"
                  sm={{ span: 2, offset: 1 }} lg={{ span: 2, offset: 2 }}
                  className="text-lg"
                >
                  Customize the name that appears in the greeting:
                </Form.Label>
              </Col>
              <Col sm="8" lg="6" className="my-4">
                <Form.Control
                  type="text"
                  className="bg-slate-800 py-2 px-3 text-lg rounded"
                  defaultValue={name}
                  onChange={e => setName(e.target.value)}
                />
              </Col>

            </Form.Group>
          </Form>
        </>
      }
      footer={
        <div className="flex flex-row justify-end">
          <button
            type="button"
            className="py-2 px-3 rounded border border-slate-200"
            onClick={() => onClose?.()}
          >
            Done
          </button>
        </div>
      }
    />
  );
}
